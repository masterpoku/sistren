import { getClasses } from "@/actions/academic";
import { getRppDocuments } from "@/actions/rpp";
import { RppTeacherClient } from "@/features/rpp/RppTeacherClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function RppTeacherPage() {
  await verifyRoleLevel(60);
  const [documentsResult, classesResult] = await Promise.all([
    getRppDocuments(),
    getClasses(),
  ]);

  const documents = !("error" in documentsResult)
    ? documentsResult.documents
    : [];
  const classList = classesResult;

  return <RppTeacherClient documents={documents} classes={classList} />;
}
