import React from "react";
import PostTemplate from "../../templates/PostTemplate";
import { useRouter } from "next/router";

const SlugCallPost = () => {
  const { query } = useRouter();
  return <PostTemplate slug={query.slug as string} />;
};

export default SlugCallPost;
