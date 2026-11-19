import "server-only";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { defaultAlbum, defaultCover, initialInvitation, isFrontendOnly, type Invitation, type Photo, type Reply } from "./invitation";

let connection: DatabaseSync | undefined;

export function db() {
  if (connection) return connection;
  const dir = resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || "data");
  mkdirSync(dir, { recursive: true });
  const database = new DatabaseSync(resolve(dir, "invitation.sqlite"));
  database.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");
  database.exec(`
    BEGIN IMMEDIATE;
    CREATE TABLE IF NOT EXISTS invitation (
      id INTEGER PRIMARY KEY CHECK (id = 1), content TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS photos (
      position INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('cover', 'gallery')),
      src TEXT, bytes BLOB, alt TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS one_cover ON photos(role) WHERE role = 'cover';
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL,
      attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY);
  `);
  try {
    const inserted = database.prepare("INSERT OR IGNORE INTO migrations VALUES ('initial-content')").run();
    if (inserted.changes) {
      database.prepare("INSERT INTO invitation VALUES (1, ?)").run(JSON.stringify(initialInvitation));
      const insert = database.prepare("INSERT INTO photos (id, role, src, alt) VALUES (?, 'gallery', ?, ?)");
      for (const { id, src, alt } of defaultAlbum) insert.run(id, src, alt);
    }
    const artworkCopy = database.prepare("INSERT OR IGNORE INTO migrations VALUES ('canva-default-copy')").run();
    if (artworkCopy.changes && !inserted.changes) {
      const update = database.prepare("UPDATE invitation SET content = json_set(content, ?, ?) WHERE id = 1 AND json_extract(content, ?) = ?");
      update.run("$.university", initialInvitation.university, "$.university", "Trường Đại học Bách khoa – TPHCM");
      update.run("$.farewell", initialInvitation.farewell, "$.farewell", "Hẹn gặp cả nhà nhé!");
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    database.close();
    throw error;
  }
  connection = database;
  return database;
}

type PhotoRow = { id: string; src: string | null; alt: string };

function photo(row: PhotoRow): Photo {
  return { id: row.id, src: row.src ?? `/media/${row.id}`, alt: row.alt };
}

export function getInvitation() {
  if (isFrontendOnly()) {
    return { content: initialInvitation, cover: defaultCover, album: defaultAlbum };
  }
  const store = db();
  const entry = store.prepare("SELECT content FROM invitation WHERE id = 1").get() as { content: string };
  const cover = store.prepare("SELECT id, src, alt FROM photos WHERE role = 'cover'").get() as PhotoRow | undefined;
  const album = store.prepare("SELECT id, src, alt FROM photos WHERE role = 'gallery' ORDER BY position").all() as PhotoRow[];
  return {
    content: { ...initialInvitation, ...JSON.parse(entry.content) } as Invitation,
    cover: cover ? photo(cover) : defaultCover,
    album: album.map(photo),
  };
}

export function getReplies() {
  return db().prepare("SELECT id, name, message, attendance, createdAt FROM replies ORDER BY id DESC").all() as Reply[];
}

export function savePhoto(id: string, role: "cover" | "gallery", bytes: Buffer, alt: string) {
  const store = db();
  store.exec("BEGIN IMMEDIATE");
  try {
    if (role === "cover") store.prepare("DELETE FROM photos WHERE role = 'cover'").run();
    store.prepare("INSERT INTO photos (id, role, bytes, alt) VALUES (?, ?, ?, ?)").run(id, role, bytes, alt);
    store.exec("COMMIT");
  } catch (error) {
    store.exec("ROLLBACK");
    throw error;
  }
}
