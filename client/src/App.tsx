import { Theme } from "@astryxdesign/core/theme";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { prospectaTheme } from "./theme";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/leads" component={Home} />
      <Route path="/crm" component={Home} />
      <Route path="/mensagens" component={Home} />
      <Route path="/sites" component={Home} />
      <Route path="/configuracoes" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Theme theme={prospectaTheme} mode="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </Theme>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
