const fs = require('fs');

const file = 'src/routes/peminjam/pinjam/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace Table definitions to simply cut Tgl Acara -> Keterangan
content = content.replace(/      \{\r?\n        header: 'Tgl Acara',[\s\S]*?\} \? ' \(\{revisorUser\.unit\.name\}\)' : ''\}`[\s\S]*?return <span className='text-sm text-gray-400'>-<\/span>;\r?\n        \},\r?\n      \},/gm, 
`      {
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
      }`);

content = content.replace("import { DataTable, type ColumnDef } from '@/shared/components/ui/data-table';", 
"import { DataTable, type ColumnDef } from '@/shared/components/ui/data-table';\nimport { Eye } from 'lucide-react';");

fs.writeFileSync(file, content);
console.log('done');
