import Link from "next/link";

function Footer() {
  return (
    <footer className="p-4 block lg:hidden border-t border-base-200 relative">
      <div className="flex p-4 lg:px-20 items-center gap-3">
        <Link
          href="https://x.com/blobsguru"
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          aria-label="Blobs Guru on X"
          className="btn btn-circle btn-sm transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <title>Blobs Guru on X</title>
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
          </svg>
        </Link>
        <a
          href="https://bsaurabh.xyz"
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className="text-primary underline text-sm lg:text-base"
        >
          @saurabh_evm
        </a>
      </div>
    </footer>
  );
}

export default Footer;
