const fs = require('fs');

const idxPath = 'src/routes/peminjam/pinjam/index.tsx';
let content = fs.readFileSync(idxPath, 'utf8');

// Find start of 'Tgl Acara'
const startIdx = content.indexOf(`      {\n        header: 'Tgl Acara',`);
// Find end of 'Keterangan'
const endStr = `return <span className='text-sm text-gray-400'>-</span>;\n        },\n      },`;
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + 
`      {
        header: 'Status',
        className: '',
        cell: (doc) => <DocumentStatusBadge doc={doc} />,
      },
      {
        header: 'Aksi',
        className: 'text-center',
        cell: (doc) => (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 w-full justify-center"
            onClick={() => {
              navigate({
                to: '/peminjam/pinjam/detail/$id',
                params: { id: doc.id.toString() },
              });
            }}
          >
            <Eye className="w-4 h-4" />
            Detail
          </Button>
        ),
      },` + content.substring(endIdx + endStr.length);

  fs.writeFileSync(idxPath, content);
  console.log('Fixed index.tsx column display');
} else {
  console.log('Could not find replace block...');
}
