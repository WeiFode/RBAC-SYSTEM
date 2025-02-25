interface Props {
  seoTitle: string;
  seoDescription: string;
  icon?: string;
}

export default function Metadata({ seoTitle, seoDescription, icon }: Props) {
  return (
    <>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {icon && <link rel="icon" href={icon} />}
    </>
  );
}