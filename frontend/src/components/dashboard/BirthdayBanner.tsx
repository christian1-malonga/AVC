import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cake } from "lucide-react";

interface BirthdayPerson {
  id: string;
  full_name: string;
  birthday: string;
  section: string;
  role: string;
}

export function BirthdayBanner() {
  const [birthdays, setBirthdays] = useState<BirthdayPerson[]>([]);

  useEffect(() => {
    fetch("/birthdays/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("avc_token")}` },
    })
      .then((r) => r.json())
      .then((res) => setBirthdays(res.data || []))
      .catch(() => {});
  }, []);

  if (birthdays.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-200 dark:border-pink-800/40 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40">
          <Cake className="h-5 w-5 text-pink-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-pink-700 dark:text-pink-300">
            Happy Birthday!
          </p>
          <p className="text-sm text-muted-foreground">
            {birthdays.map((b) => b.full_name).join(", ")}
            {birthdays.length === 1 ? " is" : " are"} celebrating today! 🎉
          </p>
        </div>
      </div>
    </motion.div>
  );
}
