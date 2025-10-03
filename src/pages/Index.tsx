import { useEffect, useState } from "react";
import { MetricsCard } from "@/components/MetricsCard";
import { RiskDistributionChart } from "@/components/RiskDistributionChart";
import { ArticleTable } from "@/components/ArticleTable";
import { AlertTriangle, FileText, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  Title: string;
  Risk_Type: string;
  Severity: string;
  Affected_Nodes: string[];
  Explanation: string;
  Risk_Score: number;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data/tata_motors_risk_analysis.json");
        if (!response.ok) throw new Error("Failed to load data");
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load risk analysis data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading risk analysis data...</p>
        </div>
      </div>
    );
  }

  const totalArticles = articles.length;
  const highRiskCount = articles.filter((a) => a.Severity.toLowerCase() === "high").length;
  const avgRiskScore = (
    articles.reduce((sum, a) => sum + a.Risk_Score, 0) / totalArticles
  ).toFixed(1);
  const supplyChainRisks = articles.filter(
    (a) => a.Risk_Type.toLowerCase() === "supply chain"
  ).length;

  const riskTypeData = [
    {
      name: "Supply Chain",
      value: articles.filter((a) => a.Risk_Type.toLowerCase() === "supply chain").length,
      color: "hsl(var(--warning))",
    },
    {
      name: "Strategic",
      value: articles.filter((a) => a.Risk_Type.toLowerCase() === "strategic").length,
      color: "hsl(var(--primary))",
    },
    {
      name: "None",
      value: articles.filter((a) => a.Risk_Type.toLowerCase() === "none").length,
      color: "hsl(var(--muted))",
    },
  ];

  const severityData = [
    {
      name: "High",
      value: articles.filter((a) => a.Severity.toLowerCase() === "high").length,
      color: "hsl(var(--destructive))",
    },
    {
      name: "Medium",
      value: articles.filter((a) => a.Severity.toLowerCase() === "medium").length,
      color: "hsl(var(--warning))",
    },
    {
      name: "Low",
      value: articles.filter((a) => a.Severity.toLowerCase() === "low").length,
      color: "hsl(var(--success))",
    },
    {
      name: "None",
      value: articles.filter((a) => a.Severity.toLowerCase() === "none").length,
      color: "hsl(var(--muted))",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Risk Analysis Dashboard</h1>
              <p className="text-muted-foreground">Tata Motors - Comprehensive Risk Monitoring</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Articles"
            value={totalArticles.toLocaleString()}
            icon={FileText}
            trend="All analyzed articles"
          />
          <MetricsCard
            title="High Risk Alerts"
            value={highRiskCount.toLocaleString()}
            icon={AlertTriangle}
            trend={`${((highRiskCount / totalArticles) * 100).toFixed(1)}% of total`}
            variant="destructive"
          />
          <MetricsCard
            title="Avg Risk Score"
            value={avgRiskScore}
            icon={TrendingUp}
            trend="Across all articles"
            variant="warning"
          />
          <MetricsCard
            title="Supply Chain Risks"
            value={supplyChainRisks.toLocaleString()}
            icon={Shield}
            trend={`${((supplyChainRisks / totalArticles) * 100).toFixed(1)}% of total`}
            variant="warning"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <RiskDistributionChart data={riskTypeData} title="Risk Type Distribution" />
          <RiskDistributionChart data={severityData} title="Severity Distribution" />
        </section>

        <section>
          <ArticleTable articles={articles} />
        </section>
      </main>
    </div>
  );
};

export default Index;
