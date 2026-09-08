import { generateToolJsonLd } from "@/lib/seo/tool-seo";

interface ToolJsonLdProps {
  slug: string;
}

export function ToolJsonLd({ slug }: ToolJsonLdProps) {
  const schema = generateToolJsonLd(slug);

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
