import Link from 'next/link';
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  const pagesNames = pageName.split('/');

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">{pageName}</h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              Dashboard /
            </Link>
          </li>
          {pagesNames.map((name, index) => (
            <li key={index} className={`font-medium ${index === pagesNames.length - 1 ? 'text-primary' : ''}`}>
              <Link className="font-medium" href={`/admin/${name.toLowerCase().replace(' ', '-')}/`}>
                {name} {index === pagesNames.length - 1 ? '' : '/'}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
