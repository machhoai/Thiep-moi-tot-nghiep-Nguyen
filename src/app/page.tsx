import { generateMetadata, InvitationPage } from "./invitation-page";

export { generateMetadata };
export const dynamic = "force-dynamic";

export default function Home() {
    return <InvitationPage />;
}
