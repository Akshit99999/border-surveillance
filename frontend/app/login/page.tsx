"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Key, Lock, Radio, Shield } from "lucide-react";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { tacticalSound } from "@/lib/sound";

export default function LoginPage() {
  const router = useRouter();
  const [operatorId, setOperatorId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    tacticalSound.playClick();
    setIsVerifying(true);
    window.setTimeout(() => router.push("/dashboard"), 500);
  };

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center p-6 relative font-mono text-[#e5e2e1]">
      <div className="relative max-w-md w-full bg-[#1c1b1b] border border-[#454843] rounded-none p-8 z-10">
        <div className="text-center pb-6 border-b border-[#454843]">
          <div className="w-10 h-10 bg-[#F5F5F0] text-[#121212] flex items-center justify-center mx-auto mb-4 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#F5F5F0]">
            BORDERLENS // CONSOLE_AUTH
          </h2>
          <p className="text-[10px] text-[#8f918c] mt-1 tracking-wider">
            RESTRICTED ACCESS // NODE_ALPHA_07
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 pt-6">
          <div className="relative pt-4">
            <label className="text-[10px] text-[#8f918c] uppercase tracking-widest font-bold block mb-1">
              OPERATOR_ID
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#8f918c] absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={operatorId}
                onChange={(event) => setOperatorId(event.target.value)}
                placeholder="OP_ALPHA_01"
                className="w-full bg-transparent border-0 border-b border-[#454843] focus:border-[#F5F5F0] rounded-none py-2 pl-7 pr-2 text-xs text-[#F5F5F0] placeholder:text-[#454843] font-mono transition-colors"
                required
              />
            </div>
          </div>

          <div className="relative pt-2">
            <label className="text-[10px] text-[#8f918c] uppercase tracking-widest font-bold block mb-1">
              SECURITY_PASSCODE / TOKEN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8f918c] absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent border-0 border-b border-[#454843] focus:border-[#F5F5F0] rounded-none py-2 pl-7 pr-2 text-xs text-[#F5F5F0] placeholder:text-[#454843] font-mono transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <TacticalButton
              variant="primary"
              size="lg"
              type="submit"
              loading={isVerifying}
              className="w-full font-bold"
            >
              {isVerifying ? "AUTHENTICATING..." : "VERIFY & ENTER CONSOLE"}
            </TacticalButton>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#454843] flex items-center justify-between text-[10px] text-[#8f918c]">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#F5F5F0]" />
            <span>SESSION_ENCRYPTED</span>
          </div>
          <Link href="/" className="hover:text-[#F5F5F0] transition-colors">
            ← PUBLIC PORTAL
          </Link>
        </div>
      </div>
    </div>
  );
}
