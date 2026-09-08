import { generateToolMetadata } from "@/lib/seo/tool-seo";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";

export const metadata = generateToolMetadata("seo-checker");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolJsonLd slug="seo-checker" />
      {children}
    </>
  );
}
