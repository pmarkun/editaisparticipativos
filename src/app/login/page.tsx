import LoginForm from "@/components/auth/LoginForm";
import PageContainer from "@/components/shared/PageContainer";

export default function LoginPage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Adjust min-h based on header/footer */}
      <LoginForm />
    </PageContainer>
  );
}
