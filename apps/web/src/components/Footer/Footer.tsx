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
        <Link
          href="https://github.com/saurabhburade/blobs-guru-app"
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          aria-label="Blobs Guru on GitHub"
          className="btn btn-circle btn-sm transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <title>Blobs Guru on GitHub</title>
            <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.39 0-.19-.01-.83-.01-1.51-2.01.38-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.9-3.64-4.02 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.91c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.3.82 2.19 0 3.13-1.87 3.81-3.65 4.02.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39A8.14 8.14 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
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
