"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, CirclePlay, LogOut, RotateCw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { catalog, type CatalogItem, type SelectionKind } from "@/lib/catalog";
import { loginSchema, type LoginFormInput, type LoginValues } from "@/lib/login-schema";
import { useAtelierStore } from "@/lib/store";
import { publicAsset } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
} as const;

function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <Sparkles aria-hidden="true" size={15} strokeWidth={1.5} />
      MORPHEUS <span>MACAU</span>
    </span>
  );
}

function OptionCard({
  item,
  kind,
  selected,
  index,
  onSelect,
}: {
  item: CatalogItem;
  kind: SelectionKind;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      layout
      type="button"
      className={`option-card ${selected ? "is-selected" : ""} ${kind === "cutlery" ? "cutlery-card" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.045 }}
      whileTap={{ scale: 0.975 }}
    >
      <span className={`option-image ${item.previewImage ? "product-image" : ""}`}>
        {item.image ? (
          <Image src={publicAsset(item.previewImage ?? item.image)} alt="" fill sizes="(max-width: 700px) 40vw, 190px" quality={90} />
        ) : (
          <span className={`flatware-art art-${item.art}`} aria-hidden="true" />
        )}
        {selected && <motion.span layoutId={`selected-${kind}`} className="selected-check"><Check size={13} /></motion.span>}
      </span>
      <span className="option-copy">
        <strong>{item.name}</strong>
        <small>{item.detail}</small>
      </span>
    </motion.button>
  );
}

function SelectionGroup({
  kind,
  title,
  selectedId,
  onSelect,
}: {
  kind: SelectionKind;
  title: string;
  selectedId: string;
  onSelect: (kind: SelectionKind, id: string) => void;
}) {
  return (
    <section className={`selection-group group-${kind}`} aria-label={`${title} selection`}>
      <div className="group-heading"><h2>{title}</h2><span>{String(catalog[kind].length).padStart(2, "0")}</span></div>
      <div className="option-list">
        {catalog[kind].map((item, index) => (
          <OptionCard key={item.id} item={item} kind={kind} index={index} selected={selectedId === item.id} onSelect={() => onSelect(kind, item.id)} />
        ))}
      </div>
    </section>
  );
}

function TablePreview({ confirmation = false }: { confirmation?: boolean }) {
  const plateId = useAtelierStore((state) => state.plate);
  const cutleryId = useAtelierStore((state) => state.cutlery);
  const glassId = useAtelierStore((state) => state.glass);
  const plate = catalog.plate.find((item) => item.id === plateId);
  const cutlery = catalog.cutlery.find((item) => item.id === cutleryId);
  const glass = catalog.glass.find((item) => item.id === glassId);

  return (
    <div className={`table-preview ${confirmation ? "confirmation-table" : ""}`}>
      <Image className="table-photo" src={publicAsset("/lalique-table.png")} alt="The Lalique crystal table at Morpheus" fill priority sizes="(max-width: 900px) 100vw, 52vw" quality={92} />
      <div className="table-shade" />
      <div className="table-setting" aria-hidden="true">
        {plate && <motion.div key={plate.id} className="setting-plate" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 20 }}><Image src={publicAsset(plate.previewImage ?? plate.image!)} alt="" fill sizes="300px" quality={90} /></motion.div>}
        {cutlery && <motion.div key={cutlery.id} className={`setting-cutlery finish-${cutlery.id} ${cutlery.previewImage ? "has-photo" : ""}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>{cutlery.previewImage ? <Image src={publicAsset(cutlery.previewImage)} alt="" fill sizes="140px" quality={90} /> : <><i /><i /><i /></>}</motion.div>}
        {glass && <motion.div key={glass.id} className="setting-glass" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 20 }}><Image src={publicAsset(glass.previewImage ?? glass.image!)} alt="" fill sizes="180px" quality={90} /></motion.div>}
      </div>
      <div className="preview-label">
        <span>{plate?.name ?? "Your table, taking shape"}</span>
        <small>{[cutlery?.name, glass?.name].filter(Boolean).join(" · ") || "LIVE TABLE PREVIEW"}</small>
      </div>
      {!confirmation && <span className="live-indicator"><i /> LIVE PREVIEW</span>}
    </div>
  );
}

export function TableAtelier() {
  const stage = useAtelierStore((state) => state.stage);
  const guestName = useAtelierStore((state) => state.guestName);
  const plate = useAtelierStore((state) => state.plate);
  const cutlery = useAtelierStore((state) => state.cutlery);
  const glass = useAtelierStore((state) => state.glass);
  const confirmed = useAtelierStore((state) => state.confirmed);
  const setStage = useAtelierStore((state) => state.setStage);
  const setGuestName = useAtelierStore((state) => state.setGuestName);
  const choose = useAtelierStore((state) => state.choose);
  const setConfirmed = useAtelierStore((state) => state.setConfirmed);
  const reset = useAtelierStore((state) => state.reset);
  const [videoOpen, setVideoOpen] = useState(false);
  const form = useForm<LoginFormInput, unknown, LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { guestName: "", accessCode: "" } });
  const ready = Boolean(plate && cutlery && glass);

  function enterExperience(values: LoginValues) {
    setGuestName(values.guestName);
    setStage("welcome");
  }

  function logout() {
    setVideoOpen(false);
    form.reset();
    reset();
  }

  function swapPlate() {
    const current = catalog.plate.findIndex((item) => item.id === plate);
    choose("plate", catalog.plate[(current + 1) % catalog.plate.length].id);
  }

  return (
    <div className="site-shell">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "login" && (
          <motion.main key="login" className="login-screen" {...pageMotion}>
            <Image className="login-photo" src={publicAsset("/restaurant-background.webp")} alt="The dining room at Morpheus Macau" fill priority sizes="100vw" quality={92} />
            <div className="login-wash" />
            <div className="login-frame" />
            <div className="login-top"><Brand light /><span>PRIVATE DINING · 2026</span></div>
            <div className="login-layout">
              <div className="login-story">
                <p className="eyebrow">A PRIVATE EVENING AWAITS</p>
                <h1>Alain Ducasse<br /><em>at Morpheus</em></h1>
                <p className="login-intro">A table shaped around you.<br />A night worth remembering.</p>
              </div>
              <Card className="login-card">
                <CardContent className="login-card-content">
                  <p className="card-kicker">WELCOME TO THE ATELIER</p>
                  <h2>Begin your<br /><em>evening</em></h2>
                  <form className="login-form" onSubmit={form.handleSubmit(enterExperience)} noValidate>
                    <label htmlFor="guestName">GUEST NAME</label>
                    <Input id="guestName" autoComplete="name" placeholder="Your name" aria-invalid={Boolean(form.formState.errors.guestName)} {...form.register("guestName")} />
                    {form.formState.errors.guestName && <span className="field-error">{form.formState.errors.guestName.message}</span>}
                    <label htmlFor="accessCode">WELCOME CODE</label>
                    <Input id="accessCode" autoComplete="one-time-code" placeholder="Enter your invitation code" aria-invalid={Boolean(form.formState.errors.accessCode)} {...form.register("accessCode")} />
                    {form.formState.errors.accessCode && <span className="field-error">{form.formState.errors.accessCode.message}</span>}
                    <Button className="submit-button" type="submit">Enter the experience <ArrowRight size={17} /></Button>
                    <p className="demo-note">DEMO ACCESS <span>ATELIER26</span> OR <span>123456</span></p>
                  </form>
                </CardContent>
              </Card>
            </div>
            <footer className="login-footer"><span>MORPHEUS</span><span>MACAU · COTAI</span><span>01 — 04</span></footer>
          </motion.main>
        )}

        {stage === "welcome" && (
          <motion.main key="welcome" className="welcome-screen" {...pageMotion}>
            <header className="screen-header"><Brand /><Button variant="ghost" size="sm" onClick={logout}>Log out <LogOut size={14} /></Button></header>
            <section className="welcome-content">
              <div className="welcome-media-wrap">
                <button type="button" className="welcome-media" onClick={() => setVideoOpen(true)} aria-label="Play the Morpheus introduction film">
                  <Image src={publicAsset("/restaurant-background.webp")} alt="The dining room at Morpheus Macau" fill sizes="(max-width: 760px) 100vw, 55vw" quality={92} />
                  <span className="play-disc"><CirclePlay size={39} strokeWidth={1.2} /></span>
                  <span className="media-caption">THE LALIQUE TABLE · MORPHEUS MACAU</span>
                </button>
                <div className="welcome-note"><span>AN ART OF ITS OWN</span><p>French savoir-faire, crystal artistry and the quiet pleasure of a table prepared just for you.</p></div>
              </div>
              <div className="welcome-copy">
                <p className="eyebrow">WELCOME{guestName ? `, ${guestName.toUpperCase()}` : " TO YOUR EVENING"}</p>
                <h1>The art of<br />a table,<br /><em>made yours.</em></h1>
                <p>Discover exceptional crystal details and thoughtful craftsmanship, then make a few final choices for your private dining experience.</p>
                <div className="welcome-rule"><span>01</span><i /><span>THE EVENING&apos;S CENTREPIECE</span></div>
                <Button className="continue-button" onClick={() => setStage("selection")}>Set your table <ArrowRight size={17} /></Button>
              </div>
            </section>
            <footer className="screen-footer"><span>ALAIN DUCASSE AT MORPHEUS</span><span>AN EXPERIENCE IN DETAIL</span></footer>
          </motion.main>
        )}

        {stage === "selection" && (
          <motion.main key="selection" className="atelier-screen" {...pageMotion}>
            <header className="screen-header atelier-header">
              <Brand />
              <div className="header-center"><span>YOUR PRIVATE DINING EXPERIENCE</span><strong>The Lalique Table</strong></div>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out">Log out <LogOut size={14} /></Button>
            </header>
            <main className="atelier-main">
              <div className="atelier-heading">
                <div><p className="eyebrow">A PLACE SETTING, YOURS</p><h1>Every detail,<br /><em>considered.</em></h1></div>
                <p>Choose the pieces that will make<br />your evening unmistakably yours.</p>
              </div>
              <div className="atelier-grid">
                <aside className="catalog-column left-column">
                  <SelectionGroup kind="plate" title="The foundation" selectedId={plate} onSelect={choose} />
                  <SelectionGroup kind="cutlery" title="The finishing touch" selectedId={cutlery} onSelect={choose} />
                </aside>
                <section className="preview-column" aria-label="Live table setting preview">
                  <div className="preview-overline"><span>PREPARED FOR {guestName.toUpperCase()}</span><span>TABLE No. 01</span></div>
                  <TablePreview />
                  <div className="preview-controls">
                    <span>YOUR SELECTION</span>
                    <Button variant="outline" size="sm" onClick={swapPlate}><RotateCw size={13} /> Swap plate</Button>
                  </div>
                  <div className="summary-strip">
                    <div><small>PLATE</small><strong>{catalog.plate.find((item) => item.id === plate)?.name ?? "Not selected"}</strong></div>
                    <div><small>SILVER</small><strong>{catalog.cutlery.find((item) => item.id === cutlery)?.name ?? "Not selected"}</strong></div>
                    <div><small>CRYSTAL</small><strong>{catalog.glass.find((item) => item.id === glass)?.name ?? "Not selected"}</strong></div>
                  </div>
                  <Button className="review-button" disabled={!ready} onClick={() => setStage("confirmation")}>Review your table <ArrowRight size={17} /></Button>
                </section>
                <aside className="catalog-column right-column">
                  <SelectionGroup kind="glass" title="The crystal" selectedId={glass} onSelect={choose} />
                  <Card className="atelier-aside-note"><CardContent><span>02 / 04</span><p>Chosen with care.<br /><em>Set for the moment.</em></p></CardContent></Card>
                </aside>
              </div>
            </main>
            <footer className="screen-footer"><span>THE LALIQUE TABLE</span><span>01 — 04 · PERSONALISING YOUR PLACE SETTING</span></footer>
          </motion.main>
        )}

        {stage === "confirmation" && (
          <motion.main key="confirmation" className="confirmation-screen" {...pageMotion}>
            <header className="screen-header"><Brand /><Button variant="ghost" size="sm" onClick={logout}>Log out <LogOut size={14} /></Button></header>
            <section className="confirmation-content">
              <p className="eyebrow">PREPARED WITH CARE</p>
              <h1>Your table setting<br /><em>is ready.</em></h1>
              <p className="confirmation-intro">A considered setting for <strong>{guestName}</strong>.</p>
              <TablePreview confirmation />
              <div className="confirmation-summary">
                {[plate, cutlery, glass].map((id, index) => {
                  const item = catalog[(["plate", "cutlery", "glass"] as SelectionKind[])[index]].find((entry) => entry.id === id);
                  return <div key={id}><span>0{index + 1}</span><strong>{item?.name}</strong></div>;
                })}
              </div>
              <Button className={`confirm-button ${confirmed ? "is-confirmed" : ""}`} onClick={() => setConfirmed(true)} disabled={confirmed}>
                {confirmed ? "Table setting confirmed" : "Confirm table setting"}{confirmed ? <Check size={17} /> : <ArrowRight size={17} />}
              </Button>
              <p className="confirmation-thanks">{confirmed ? `Thank you, ${guestName}. We look forward to welcoming you.` : "Your host will have your table prepared for the evening."}</p>
              <Button variant="ghost" className="edit-button" onClick={() => setStage("selection")}><ArrowLeft size={15} /> Edit your selection</Button>
            </section>
            <footer className="screen-footer"><span>ALAIN DUCASSE AT MORPHEUS</span><span>04 — 04 · YOUR EVENING AWAITS</span></footer>
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {videoOpen && (
          <motion.div className="video-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setVideoOpen(false); }}>
            <motion.div className="video-dialog" role="dialog" aria-modal="true" aria-label="Morpheus introduction film" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
              <Button variant="ghost" size="icon" className="video-close" aria-label="Close video" onClick={() => setVideoOpen(false)}><X size={18} /></Button>
              <video src={publicAsset("/Morpheus.m4v")} poster={publicAsset("/restaurant-background.webp")} controls autoPlay playsInline preload="metadata">Your browser does not support the video element.</video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}