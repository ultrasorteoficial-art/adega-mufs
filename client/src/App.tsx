import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegisterPrice from "./pages/RegisterPrice";
import PriceComparison from "./pages/PriceComparison";
import ProductManagement from "./pages/ProductManagement";
import PriceHistory from "./pages/PriceHistory";

function Router() {
  return (
    <Switch>
      {/* Redirecionar a raiz para o Dashboard para ter o layout azul de cara */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/cadastro-cliente" component={Home} />
      <Route path="/registrar-precos" component={RegisterPrice} />
      <Route path="/prices" component={RegisterPrice} />
      <Route path="/comparacao" component={PriceComparison} />
      <Route path="/comparison" component={PriceComparison} />
      <Route path="/produtos" component={ProductManagement} />
      <Route path="/products" component={ProductManagement} />
      <Route path="/historico" component={PriceHistory} />
      <Route path="/history" component={PriceHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="adega-mufs-theme">
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
