"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";
import type { OryCMSPaymentLinkRecord } from "@/payments";

/**
 * Creates a Razorpay Payment Link via POST /api/orycms/payments/links (which
 * calls the real Razorpay API server-side, then persists the returned link).
 * Amount is entered in rupees here and converted to paise before it's ever
 * sent — Razorpay's API and this codebase's stored `amount` column are both
 * in the smallest currency unit.
 */
export function OryCMSCreatePaymentLinkDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (link: OryCMSPaymentLinkRecord) => void;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<OryCMSPaymentLinkRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const resetFields = () => {
    setAmount("");
    setDescription("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerContact("");
    setCreated(null);
    setCopied(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    if (!next) resetFields();
    onOpenChange(next);
  };

  const amountRupees = Number(amount);
  const canSubmit = amountRupees > 0 && Number.isFinite(amountRupees);

  const handleCreate = async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      const { link } = await fetchJson<{ link: OryCMSPaymentLinkRecord }>(
        "/api/orycms/payments/links",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(amountRupees * 100),
            description: description || undefined,
            customerName: customerName || undefined,
            customerEmail: customerEmail || undefined,
            customerContact: customerContact || undefined,
          }),
        },
      );
      setCreated(link);
      onCreated(link);
      toast.success("Payment link created");
    } catch (err) {
      toast.error("Couldn't create payment link", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New payment link</DialogTitle>
          <DialogDescription>
            Creates a Razorpay payment link customers can pay through directly — no card details
            ever touch OryCMS.
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-[12.5px] text-success">
              <Link2 className="h-4 w-4 shrink-0" />
              Link created — share it with your customer.
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted/40 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-[12.5px]">{created.shortUrl}</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 shrink-0 px-2">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pl-amount">Amount (₹)</Label>
              <Input
                id="pl-amount"
                inputMode="decimal"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl-description">Description</Label>
              <Input
                id="pl-description"
                placeholder="Invoice #1042"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pl-customer-name">Customer name</Label>
                <Input
                  id="pl-customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pl-customer-contact">Phone</Label>
                <Input
                  id="pl-customer-contact"
                  type="tel"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl-customer-email">Customer email</Label>
              <Input
                id="pl-customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {created ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={submitting || !canSubmit}>
                {submitting ? "Creating…" : "Create link"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
