import { useEffect, useState } from "react";
import { MetricsCard } from "@/components/MetricsCard";
import { RiskDistributionChart } from "@/components/RiskDistributionChart";
import { ArticleTable } from "@/components/ArticleTable";
import { AlertTriangle, FileText, TrendingUp, Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  Title: string;
  Risk_Type: string;
  Severity: string;
  Affected_Nodes: string[];
  Explanation: string;
  Risk_Score: number;
  Source?: string;
  PublishedAt?: string;
  Url?: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const fetchAndAnalyzeNews = async () => {
    setAnalyzing(true);
    try {
      // Step 1: Fetch news
      toast({
        title: "Fetching News",
        description: "Retrieving latest articles...",
      });

      const { data: newsData, error: newsError } = await supabase.functions.invoke('fetch-news', {
        body: { 
          query: 'Tata Motors OR automotive OR electric vehicle OR supply chain OR battery OR semiconductor',
          pageSize: 20 
        }
      });

      if (newsError) throw newsError;
      
      const newsArticles = newsData?.articles || [];
      console.log('Fetched articles:', newsArticles.length);

      if (newsArticles.length === 0) {
        toast({
          title: "No Articles Found",
          description: "No recent news articles were found.",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Analyze with AI
      toast({
        title: "Analyzing Risks",
        description: `Analyzing ${newsArticles.length} articles with AI...`,
      });

      const { data: analyzedData, error: analyzeError } = await supabase.functions.invoke('analyze-risk', {
        body: { articles: newsArticles }
      });

      if (analyzeError) throw analyzeError;

      const analyzedArticles = analyzedData || [];
      setArticles(analyzedArticles);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${analyzedArticles.length} articles`,
      });

    } catch (error) {
      console.error("Error fetching and analyzing news:", error);
      toast({
        title: "Error",
        description: "Failed to fetch or analyze news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    // Load initial data from static JSON
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <header className="relative border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="absolute inset-0 gradient-glow opacity-50"></div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl animate-glow"></div>
                <Shield className="h-10 w-10 text-primary relative z-10" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Risk Analysis Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">Tata Motors - Real-time Risk Monitoring with AI</p>
              </div>
            </div>
            <Button 
              onClick={fetchAndAnalyzeNews} 
              disabled={analyzing || loading}
              size="lg"
              className="gap-2 shadow-premium hover:shadow-glow transition-all duration-300 hover:scale-105 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Analyzing...' : 'Fetch & Analyze News'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-12 relative">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Articles", value: totalArticles.toLocaleString(), icon: FileText, trend: "All analyzed articles", variant: "default" as const, delay: "0s" },
            { title: "High Risk Alerts", value: highRiskCount.toLocaleString(), icon: AlertTriangle, trend: `${((highRiskCount / totalArticles) * 100).toFixed(1)}% of total`, variant: "destructive" as const, delay: "0.1s" },
            { title: "Avg Risk Score", value: avgRiskScore, icon: TrendingUp, trend: "Across all articles", variant: "warning" as const, delay: "0.2s" },
            { title: "Supply Chain Risks", value: supplyChainRisks.toLocaleString(), icon: Shield, trend: `${((supplyChainRisks / totalArticles) * 100).toFixed(1)}% of total`, variant: "warning" as const, delay: "0.3s" }
          ].map((metric, idx) => (
            <div key={idx} className="animate-slide-up" style={{ animationDelay: metric.delay }}>
              <MetricsCard {...metric} />
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <RiskDistributionChart data={riskTypeData} title="Risk Type Distribution" />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <RiskDistributionChart data={severityData} title="Severity Distribution" />
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <ArticleTable articles={articles} />
        </section>
      </main>
    </div>
  );
};

export default Index;
