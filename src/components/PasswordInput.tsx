
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  password: string;
  onChange: (value: string) => void;
}

const PasswordInput = ({ password, onChange }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 text-lg py-6"
        autoComplete="new-password"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-slate-400" />
        ) : (
          <Eye className="h-5 w-5 text-slate-400" />
        )}
      </Button>
    </div>
  );
};

export default PasswordInput;
