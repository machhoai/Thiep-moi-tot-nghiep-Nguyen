import { notFound } from "next/navigation";
import { generateMetadata, InvitationPage } from "../invitation-page";

export { generateMetadata };
export const dynamic = "force-dynamic";

export default async function GuestInvitation({ params }: { params: Promise<{ guest: string }> }) {
    const { guest } = await params;
    let guestName = guest.trim();
    if (/%[\da-f]{2}/i.test(guestName)) {
        try {
            guestName = decodeURIComponent(guestName).trim();
        } catch {
            notFound();
        }
    }
    if (!guestName || /\.[a-z0-9]+$/i.test(guestName)) notFound();

    return <InvitationPage guestName={guestName} />;
}
