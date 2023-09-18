import {NextRequest, NextResponse} from "next/server";
import {getFirebaseAdminApp} from "@/app/firebase";
import Post from "@/types/Post";

export async function GET(request: NextRequest) {

  if (request.nextUrl.searchParams.get("slug") === null) {
    const postsResponse = await fetch(
      process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_API_ENDPOINT!,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await postsResponse.json();
    const { documents = [] } = data;
    documents.sort((a: any, b: any) => {
      return b.fields.date.timestampValue - a.fields.date.timestampValue;
    });
    const posts = documents.map((doc: any) => {
      return ParseDocToPost(doc);
    });

    return new NextResponse(JSON.stringify(posts), {
      status: postsResponse.status,
      headers: {
        "Cache-Control": "s-maxage=600, stale-while-revalidate",
      },
    });
  }
  
  // If there is a slug, return the post with that slug
  const slug = request.nextUrl.searchParams.get("slug");
  const post = await getPostBySlug(slug!);
  if (post === null) {
    return new NextResponse(null, {
      status: 404,
    });
  }
  return new NextResponse(JSON.stringify(post), {
    status: 200,
    headers: {
      "Cache-Control": "s-maxage=600, stale-while-revalidate",
    },
  });
}

/* An aux function to parse the blog collection from Firebase Firestore to a post object. */
function ParseDocToPost(doc: any): Post {
  const { title, date, content, author, description, tags, imageUrl, slug } =
    doc.fields;
  let authorData = author.mapValue.fields;
  return {
    id: doc.name.split("/").pop(),
    imageUrl: imageUrl.stringValue,
    author: {
      name: authorData.name.stringValue,
      href: authorData.href.stringValue,
      imageUrl: authorData.imageUrl.stringValue,
      role: authorData.role.stringValue,
    },
    description: description.stringValue,
    title: title.stringValue,
    date: date.timestampValue,
    tags: tags.arrayValue.values.map((tag: any) => tag.stringValue),
    content: content.stringValue,
    slug: slug.stringValue,
  };
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = getFirebaseAdminApp().firestore();
  const querySnapshot = await db
    .collection("blog")
    .where("slug", "==", slug)
    .get();
  if (querySnapshot.empty) {
    return null;
  }
  const doc = querySnapshot.docs[0].data();
  doc.date = doc.date.toDate();
  return doc as Post;
}