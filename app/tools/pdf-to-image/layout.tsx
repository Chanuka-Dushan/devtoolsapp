import { generateToolMetadata } from "@/lib/seo/tool-seo";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";

export const metadata = generateToolMetadata("pdf-to-image");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolJsonLd slug="pdf-to-image" />
      {children}
    </>
  );
}
