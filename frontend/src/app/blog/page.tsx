import Navbar from "@/components/Navbar"
import BlogPosts from "./components/BlogPosts";
import Footer from "@/components/Footer";

export default function ArticlesPage() {
  return (
    <>
    <Navbar />
      <main className="">
        <BlogPosts />
      </main>
      <Footer />
    </>
  );
}
