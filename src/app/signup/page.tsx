import SignupFormPhase1 from "@/components/auth/SignupFormPhase1";
import PageContainer from "@/components/shared/PageContainer";

export default function SignupPage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Adjust min-h */}
      <SignupFormPhase1 />
    </PageContainer>
  );
}
