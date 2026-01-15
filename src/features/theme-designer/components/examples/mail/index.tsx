import { Mail } from "@/features/theme-designer/components/examples/mail/components/mail";
import { accounts, mails } from "@/features/theme-designer/components/examples/mail/data";

export default function MailPage() {
  return <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />;
}
