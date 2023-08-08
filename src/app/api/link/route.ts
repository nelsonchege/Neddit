import axios from "axios";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const href = url.searchParams.get("url");

  if (!href) {
    return new Response("Invalid url", { status: 400 });
  }

  const res = await axios.get(href);

  const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : "";

  const desciptionMatch = res.data.match(
    /<meta name="description" content="(.*?)"/
  );
  const description = desciptionMatch ? desciptionMatch[1] : "";

  const imageMatch = res.data.match(
    /<meta property="og:image" content="(.*?)"/
  );
  const imageurl = imageMatch ? imageMatch[1] : "";

  return new Response(
    JSON.stringify({
      successs: 1,
      meta: {
        title,
        description,
        image: {
          url: imageurl,
        },
      },
    })
  );
}
