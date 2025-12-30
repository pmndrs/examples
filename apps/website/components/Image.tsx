import NextImage from "next/image";
import { ComponentProps } from "react";

const basePath = process.env.BASE_PATH;

const Image = ({ src, ...rest }: ComponentProps<typeof NextImage>) => (
  <NextImage src={`${basePath || ""}${src}`} {...rest} />
);

export default Image;
