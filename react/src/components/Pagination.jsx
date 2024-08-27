import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const activeStyle =
  " z-10 bg-indigo-600 text-white  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ";
const commonStyles =
  " relative inline-flex items-center  py-2 text-sm font-semibold focus:z-20 ";
const normalStyle =
  " text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50  focus:outline-offset-0 ";

export default function Pagination({ meta = {}, onPageClick }) {
  console.log(meta);
  function onClick(e, link){
    e.preventDefault();
    if(!link.url) {
      return;
    }
    onPageClick(link);
  }
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 shadow-md sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          href="#"
          onClick={(e) => onClick(e, meta.links[0])}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          href="#"
          onClick={(e) => onClick(e, meta.links[meta.links.length - 1])}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{meta?.from}</span> to{" "}
            <span className="font-medium">{meta?.to}</span> of{" "}
            <span className="font-medium">{meta?.total}</span> results
          </p>
        </div>
        <div>
          {meta?.total > meta.per_page && (<nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          >

            {meta?.links?.map((link, index) => (
              <a
                href="#"
                onClick={(e) => onClick(e, link)}
                key={index}
                aria-current="page"
                className={`${commonStyles}
                ${
                  link.label !== 'Next &raquo;' && link.label !== "&laquo; Previous" ?' px-4 ':' px-2 '
                }
                ${
                  index === 0 ? " rounded-l-md " : ""
                }
                  ${index === meta?.links?.length - 1 ? " rounded-r-md " : ""}
                   ${link.active ? activeStyle : normalStyle}`}
              >
                {link.label === "&laquo; Previous" ? (
                  <>
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                  </>
                ) : link.label === 'Next &raquo;' ? (
                  <>
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                  </>
                ) : (
                  link.label
                )}
              </a>
            ))}
          </nav>)}
        </div>
      </div>
    </div>
  );
}
