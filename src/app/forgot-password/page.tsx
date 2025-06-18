import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import PageContainer from "@/components/shared/PageContainer";

export default function ForgotPasswordPage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Adjust min-h */}
       <ForgotPasswordForm />
    </PageContainer>
  );
}
