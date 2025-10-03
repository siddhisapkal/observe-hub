import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, AlertTriangle, Info, AlertCircle } from "lucide-react";

interface Article {
  Title: string;
  Risk_Type: string;
  Severity: string;
  Affected_Nodes: string[];
  Explanation: string;
  Risk_Score: number;
}

interface ArticleTableProps {
  articles: Article[];
}

export const ArticleTable = ({ articles }: ArticleTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredArticles = articles.filter(
    (article) =>
      article.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.Risk_Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.Severity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getRiskTypeColor = (riskType: string) => {
    switch (riskType.toLowerCase()) {
      case "supply chain":
        return "bg-warning/10 text-warning border-warning/20";
      case "strategic":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis Reports</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles by title, risk type, or severity..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Risk Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead>Affected Nodes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedArticles.map((article, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium max-w-md truncate">
                        {article.Title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRiskTypeColor(article.Risk_Type)}>
                          {article.Risk_Type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(article.Severity)} className="gap-1">
                          {getSeverityIcon(article.Severity)}
                          {article.Severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {article.Risk_Score.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {article.Affected_Nodes.slice(0, 2).map((node, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {node}
                            </Badge>
                          ))}
                          {article.Affected_Nodes.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.Affected_Nodes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedArticle(article)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredArticles.length)} of {filteredArticles.length} articles
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.Title}</DialogTitle>
            <DialogDescription>Detailed Risk Analysis</DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Risk Type</p>
                  <Badge variant="outline" className={getRiskTypeColor(selectedArticle.Risk_Type)}>
                    {selectedArticle.Risk_Type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Severity</p>
                  <Badge variant={getSeverityVariant(selectedArticle.Severity)} className="gap-1">
                    {getSeverityIcon(selectedArticle.Severity)}
                    {selectedArticle.Severity}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Risk Score</p>
                <p className="text-2xl font-bold">{selectedArticle.Risk_Score.toFixed(1)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Affected Nodes</p>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.Affected_Nodes.length > 0 ? (
                    selectedArticle.Affected_Nodes.map((node, idx) => (
                      <Badge key={idx} variant="secondary">
                        {node}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No affected nodes identified</p>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Explanation</p>
                <p className="text-sm">{selectedArticle.Explanation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
