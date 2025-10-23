import { Button } from "@/components/ui/button";
import { Wallet, Sun, Moon, BookOpen, LogOut } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import maxLogo from "@assets/image-removebg-preview (33) - copia_1759978567237.png";

export default function StreamHeader() {
  const [isDark, setIsDark] = useState(false);
  const { address, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background/95 backdrop-blur-xl shadow-sm">
      <div className="flex h-20 items-center justify-between px-6 md:px-8 gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="relative flex items-center gap-3">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-card shadow-md">
              <img src={maxLogo} alt="CZ - BNB Chain AI" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-[Space_Grotesk] text-foreground flex items-center gap-2">
                CZ AI
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">BNB Chain 智能AI助手</p>
              <p className="text-[10px] text-muted-foreground/80 font-medium italic mt-0.5">实时 AI 直播</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1">
          <Button
            variant="default"
            asChild
            className="gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg rounded-xl px-6 py-2.5 hover:scale-105"
            data-testid="button-know-more"
          >
            <a 
              href="https://www.bnbchain.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen className="h-5 w-5" />
              <span>了解更多</span>
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="hover-elevate active-elevate-2 h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {address ? (
            <div className="flex items-center gap-2">
              <div className="bg-green-500/10 border-2 border-green-500 px-4 py-2 rounded-xl">
                <span className="text-sm font-bold text-green-600">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={disconnectWallet}
                data-testid="button-disconnect-wallet"
                className="hover-elevate active-elevate-2 h-10 w-10 rounded-lg text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              className="gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-md rounded-xl px-5 py-2"
              data-testid="button-connect-wallet"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              <Wallet className="h-5 w-5" />
              <span className="hidden sm:inline">
                {isConnecting ? '连接中...' : '连接钱包'}
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
