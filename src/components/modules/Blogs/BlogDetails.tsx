
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link, useParams } from "react-router";
import Loader from "@/pages/Spinner";
import { Button } from "@/components/ui/button";
import { useGetBlogDetailsQuery } from "@/redux/features/blog/blog.api";

const BlogDetails = () => {
  const { slug } = useParams();
  const { data, isLoading } = useGetBlogDetailsQuery(slug);


  if (isLoading) return <Loader />;
  const blog = data?.data || {};

  return (
    <div className="p-4 shadow-md rounded-md">
      {/* Header */}
      <div className="top flex items-center justify-between mb-6">
        <Link to="/news">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaArrowLeftLong /> {blog?.category?.title || "Blog"}
          </h2>
        </Link>

        <Link
          to={`/news/edit/${blog?._id}`}
        // className="text-white py-3 px-10 bg-primary font-bold rounded-lg"

        >
          <Button variant="outline">
            Edit News
          </Button>
        </Link>
      </div>

      {/* Thumbnail */}
      <img
        src={blog?.thumbnail || "/default-img.png"}
        alt={blog?.title || "Blog"}
        className="w-full rounded-md"
      />

      {/* Blog Title */}
      <h2 className="text-2xl font-bold my-5">{blog?.title}</h2>

      {/* Meta Description */}
      {blog?.metaDescription && (
        <p className=" mb-4">{blog.metaDescription}</p>
      )}

      {/* Blog Content */}
      {/* <div
        className="content w-full overflow-hidden break-words [&_img]:max-w-full [&_img]:h-auto [&_iframe]:max-w-full"
        dangerouslySetInnerHTML={{ __html: blog?.content || "" }}
      ></div> */}

      {/* Tags & Date */}
      <div className="mt-6 flex flex-wrap justify-between items-center text-sm text-gray-500 border-t pt-3">
        <div>
          <strong>Tags:</strong>{" "}
          {blog?.tags?.length ? (
            blog.tags.map((tag: string, i: number) => (
              <span key={i} className="mr-2 text-primary">
                #{tag}
              </span>
            ))
          ) : (
            <span>No tags</span>
          )}
        </div>
        <div>
          <strong>Keywords:</strong>{" "}
          {blog?.keywords?.length ? (
            blog.keywords.map((keyword: string, i: number) => (
              <span key={i} className="mr-2 text-primary">
                #{keyword}
              </span>
            ))
          ) : (
            <span>No keywords</span>
          )}
        </div>

        <div>
          <strong>Published:</strong>{" "}
          {new Date(blog?.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
