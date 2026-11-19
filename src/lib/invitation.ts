export const eventZone = "Asia/Ho_Chi_Minh";

export const initialInvitation = {
  name: "Mỹ Nguyên",
  date: "2026-11-27",
  start: "14:30",
  end: "16:50",
  venue: "Tòa B10 (Khoa Quản lý Công nghiệp)",
  university: "Trường Đại học Bách khoa - TPHCM",
  address: "268 Lý Thường Kiệt, Phường Diên Hồng, TP.HCM (cổng 1)",
  schedule: "11:00 | Chụp hình kỷ yếu với khoa\n12:30 | Làm lễ tốt nghiệp\n14:30 | Chụp ảnh kỷ niệm",
  letter: "Vậy là những năm tháng đại học của mình cũng đã đi đến chặng cuối rồi. Nhìn lại quãng thời gian vừa qua, mình thấy thật may mắn vì trên hành trình ấy luôn có gia đình, thầy cô, bạn bè và những người thương yêu ở bên cạnh.\n\nCảm ơn cả nhà vì đã luôn quan tâm, động viên, giúp đỡ và đồng hành cùng mình, dù là trong những khoảnh khắc vui vẻ hay những lúc khó khăn nhất. Mỗi sự yêu thương và sẻ chia ấy đều là một phần rất đẹp trong thanh xuân của mình.\n\nNgày tốt nghiệp sẽ càng ý nghĩa hơn nếu có mọi người ở bên để cùng chia sẻ niềm vui và lưu giữ những kỷ niệm đáng nhớ.\n\nCảm ơn vì đã đến, đã ở lại và trở thành một phần trong hành trình trưởng thành của mình.",
  dedication: "Sự hiện diện của bạn là niềm vinh hạnh của mình!",
  farewell: "Hẹn gặp cả nhà nhóe!",
};

export type Invitation = typeof initialInvitation;
export type Photo = { id: string; src: string; alt: string };
export const defaultCover: Photo = {
  id: "original",
  src: "/assets/images/my-nguyen.webp",
  alt: "Mỹ Nguyên trong lễ phục tốt nghiệp với bó hoa hồng",
};
export const defaultAlbum: Photo[] = [
  "Mỹ Nguyên tạo dáng trước bảng xanh", "Kỷ niệm trong bộ quân phục",
  "Mỹ Nguyên trong đồng phục học sinh", "Mỹ Nguyên thuở bé",
  "Mỹ Nguyên trong tà áo dài trắng", "Mỹ Nguyên trong lớp học",
  "Mỹ Nguyên trong lễ phục tốt nghiệp", "Mỹ Nguyên bên ô cửa sổ",
].map((alt, index) => {
  const number = String(index + 1).padStart(2, "0");
  return { id: `album-${number}`, src: `/assets/images/album/${number}.webp`, alt };
});

export function isFrontendOnly() {
  return process.env.INVITATION_FRONTEND_ONLY === "1";
}

export type Reply = {
  id: number;
  name: string;
  message: string;
  attendance: "yes" | "no";
  createdAt: string;
};

export const fieldLimits: Record<keyof Invitation, number> = {
  name: 70, date: 10, start: 5, end: 5, venue: 160, university: 160,
  address: 220, schedule: 1500, letter: 6000, dedication: 250, farewell: 150,
};

export function getDays(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, day, length, offset: (first + 6) % 7 };
}
