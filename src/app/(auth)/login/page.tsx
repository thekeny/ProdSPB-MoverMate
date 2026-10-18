import { LoginPageClient } from "@/app/(auth)/login/_components/login-page-client";

export default function LoginPage() {
  return <LoginPageClient testPassword={process.env.SEED_TEST_PASSWORD} />;
}
