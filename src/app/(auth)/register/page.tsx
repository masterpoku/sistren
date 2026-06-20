import { getReligions } from "@/actions/religions";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const religions = await getReligions();

  return <RegisterForm religions={religions} />;
}
