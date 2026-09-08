import { generateToolMetadata } from "@/lib/seo/tool-seo";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";

export const metadata = generateToolMetadata("json-formatter");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolJsonLd slug="json-formatter" />
      {children}
    </>
  );
}
