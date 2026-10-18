import { BookOpen } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BOX_TIPS } from "@/configs/consts/moving-tips.const";

export function BoxTips() {
  return (
    <section className="no-print mt-6 rounded-lg bg-[#E2E9DD] p-5">
      <div className="flex items-center gap-3">
        <BookOpen className="size-5 text-[#42664D]" />
        <div>
          <h2 className="font-extrabold">Памятка</h2>
          <p className="mt-1 text-xs text-[#5C6560]">
            Откройте вопрос, чтобы посмотреть, как лучше сделать.
          </p>
        </div>
      </div>
      <Accordion className="mt-4">
        {BOX_TIPS.map((tip) => (
          <AccordionItem key={tip.question} value={tip.question}>
            <AccordionTrigger>{tip.question}</AccordionTrigger>
            <AccordionPanel>{tip.answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
