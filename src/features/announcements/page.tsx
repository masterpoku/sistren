import { MOCK_ANNOUNCEMENTS } from '@/util/mock/announcements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
        <p className="text-muted-foreground">Informasi terbaru dari sekolah.</p>
      </div>

      <div className="grid gap-4">
        {MOCK_ANNOUNCEMENTS.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                {announcement.title}
              </CardTitle>
              <Badge variant="outline" className="capitalize">
                {announcement.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {announcement.content}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{announcement.date}</span>
                <span>Oleh: {announcement.author}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
