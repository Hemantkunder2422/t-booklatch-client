"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  LayoutGrid,
  Loader2,
  PartyPopper,
  Plug,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { sleep } from "@/lib/utils";
import { onboardingSchema, type OnboardingValues } from "./schema";
import { Stepper, type StepMeta } from "./stepper";
import { VenueInfoStep } from "./steps/venue-info-step";
import { SpacesStep } from "./steps/spaces-step";
import { IntegrationsStep } from "./steps/integrations-step";

const STEPS: (StepMeta & {
  heading: string;
  subheading: string;
  icon: typeof Building2;
  fields: Path<OnboardingValues>[];
})[] = [
  {
    title: "Venue info",
    description: "The basics about your venue",
    heading: "Tell us about your venue",
    subheading: "This is what guests will see when they discover your space.",
    icon: Building2,
    fields: ["venue"],
  },
  {
    title: "Spaces",
    description: "Rooms, halls & capacities",
    heading: "Add your bookable spaces",
    subheading: "Define each area guests can reserve, with capacity & pricing.",
    icon: LayoutGrid,
    fields: ["spaces"],
  },
  {
    title: "Integrations",
    description: "Payments & messaging",
    heading: "Connect your tools",
    subheading: "Choose how you'll get paid and stay in touch with guests.",
    icon: Plug,
    fields: ["integrations"],
  },
];

const DEFAULT_VALUES: OnboardingValues = {
  venue: {
    name: "",
    description: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    country: "",
    postalCode: "",
  },
  spaces: [
    {
      id: "space-1",
      name: "",
      type: "",
      layout: "indoor",
      seatedCapacity: "",
      standingCapacity: "",
      pricePerDay: "",
      amenities: [],
      images: [],
    },
  ],
  integrations: { paymentGateway: "", channels: [] },
};

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const isSubmitting = form.formState.isSubmitting;

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleNext() {
    const valid = await form.trigger(current.fields);
    if (!valid) {
      toast.error("Please complete the highlighted fields to continue.");
      return;
    }
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    await form.handleSubmit(onValid)();
  }

  async function onValid(values: OnboardingValues) {
    // TODO: POST `values` to your API via the shared axios instance.
    await sleep(1400);
    setSubmittedName(values.venue.name);
    setDone(true);
  }

  if (done) {
    return <OnboardingSuccess venueName={submittedName} />;
  }

  const StepIcon = current.icon;

  return (
    <Form {...form}>
      <div className="grid min-h-svh lg:grid-cols-[21rem_1fr]">
        {/* Left rail — pinned so it never scrolls with the form */}
        <aside className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary to-chart-4 p-10 text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -top-20 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-chart-4/30 blur-3xl" />

          <div className="relative space-y-12">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                <Building2 className="size-5" />
              </div>
              <span className="font-semibold tracking-tight">BookLatch</span>
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/80">
                <Sparkles className="size-4" />
                Venue setup
              </p>
              <h2 className="text-2xl font-semibold leading-tight tracking-tight">
                Get your venue
                <br />
                ready for bookings
              </h2>
            </div>

            <Stepper steps={STEPS} current={step} />
          </div>

          <p className="relative text-xs text-primary-foreground/70">
            Need a hand? Email{" "}
            <span className="font-medium text-primary-foreground">
              support@booklatch.com
            </span>
          </p>
        </aside>

        {/* Right content — scrolls on its own; rail stays pinned */}
        <div className="relative flex min-h-svh flex-col lg:h-svh lg:min-h-0 lg:overflow-hidden">
          {/* Subtle dotted backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50 mask-[radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Mobile progress */}
          <div className="relative border-b px-6 py-4 lg:hidden">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{current.title}</span>
              <span className="text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Scrollable step body */}
          <div className="relative flex-1 overflow-y-auto px-6 py-10 sm:px-10">
            <div className="mx-auto w-full max-w-2xl">
              <header className="mb-8 flex items-start gap-4">
                <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-chart-4 text-primary-foreground shadow-lg shadow-primary/20 lg:flex">
                  <StepIcon className="size-6" />
                </span>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
                    Step {step + 1} of {STEPS.length}
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {current.heading}
                  </h1>
                  <p className="text-muted-foreground">{current.subheading}</p>
                </div>
              </header>

              {step === 0 && <VenueInfoStep />}
              {step === 1 && <SpacesStep />}
              {step === 2 && <IntegrationsStep />}
            </div>
          </div>

          {/* Sticky footer nav */}
          <footer className="sticky bottom-0 z-10 border-t bg-background/80 px-6 py-4 backdrop-blur sm:px-10">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={back}
                disabled={step === 0 || isSubmitting}
                className={step === 0 ? "invisible" : ""}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>

              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={
                      "h-1.5 rounded-full transition-all " +
                      (i === step
                        ? "w-6 bg-primary"
                        : i < step
                          ? "w-1.5 bg-primary/50"
                          : "w-1.5 bg-muted-foreground/25")
                    }
                  />
                ))}
              </div>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Finishing…
                  </>
                ) : isLastStep ? (
                  <>
                    <PartyPopper className="size-4" />
                    Finish setup
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </Form>
  );
}

function OnboardingSuccess({ venueName }: { venueName: string }) {
  const router = useRouter();
  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 animate-ping rounded-full bg-success/20" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-8" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            You&apos;re all set! 🎉
          </h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {venueName?.trim() || "Your venue"}
            </span>{" "}
            is ready. You can start accepting bookings right away.
          </p>
        </div>
        <Button className="w-full" size="lg" onClick={() => router.push("/")}>
          Go to dashboard
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
