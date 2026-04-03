import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_COURSES } from "@/src/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Academic() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Akademik</h1>
        <p className="text-muted-foreground">
          Informasi Kartu Rencana Studi (KRS) dan Hasil Studi (KHS).
        </p>
      </div>

      <Tabs defaultValue="khs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="krs">Kartu Rencana Studi</TabsTrigger>
          <TabsTrigger value="khs">Hasil Studi</TabsTrigger>
          <TabsTrigger value="transkrip">Transkrip Nilai</TabsTrigger>
          <TabsTrigger value="jadwal">Jadwal Pelajaran</TabsTrigger>
        </TabsList>
        
        <TabsContent value="khs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari mata kuliah..."
                  className="w-[250px] pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Unduh KHS
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kartu Hasil Studi - Semester Gasal 2023/2024</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Kode</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead className="text-center">SKS</TableHead>
                    <TableHead className="text-center">Nilai</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_COURSES.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.id}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell className="text-center font-bold">{course.grade}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Lulus</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 flex justify-end gap-8 border-t pt-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">Total SKS</span>
                  <span className="text-xl font-bold">20</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">IP Semester</span>
                  <span className="text-xl font-bold">3.88</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="krs">
          <Card>
            <CardHeader>
              <CardTitle>Kartu Rencana Studi</CardTitle>
            </CardHeader>
            <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
              Masa pengisian KRS telah berakhir.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
