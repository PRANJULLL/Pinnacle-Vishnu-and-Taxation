"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLANS, EMPLOYEES, getPlanAmount } from "@/lib/constants";
import type { Task, TaskFormData } from "@/lib/types";
import { useEffect } from "react";

const toLocalISOString = (date: Date): string => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: Task | null;
  loading?: boolean;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  loading,
}: TaskFormDialogProps) {
  const isEdit = !!task;
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskFormData>({
    defaultValues: {
      orderId: "",
      client: "",
      customerName: "",
      pan: "",
      phone: "",
      email: "",
      plan: "",
      amount: 0,
      taxExpert: "",
      remarks: "",
      createdAt: toLocalISOString(new Date()),
      reference: "",
    },
  });

  const selectedPlan = watch("plan");
  const selectedClient = watch("client");

  useEffect(() => {
    if (selectedPlan) {
      setValue("amount", getPlanAmount(selectedPlan));
    }
  }, [selectedPlan, setValue]);

  useEffect(() => {
    if (task) {
      reset({
        client: task.client,
        customerName: task.customerName,
        pan: task.pan,
        phone: task.phone,
        email: task.email,
        plan: task.plan,
        amount: task.amount,
        taxExpert: task.taxExpert,
        remarks: task.remarks || "",
        status: task.status,
        createdAt: toLocalISOString(new Date(task.createdAt)),
        reference: task.reference || "",
      });
    } else {
      reset({
        orderId: "",
        client: "",
        customerName: "",
        pan: "",
        phone: "",
        email: "",
        plan: "",
        amount: 0,
        taxExpert: "",
        remarks: "",
        createdAt: toLocalISOString(new Date()),
        reference: "",
      });
    }
  }, [task, reset, open]);

  const handleFormSubmit = async (data: TaskFormData) => {
    const finalData = { ...data };
    if (finalData.client !== "Clear Tax") {
      finalData.plan = "Assisted Filing - Basic";
    }
    await onSubmit(finalData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={watch("client")}
                onValueChange={(v) => v && setValue("client", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {["Pinnacle", "Vishnu", "Clear Tax"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client && <p className="text-xs text-red-500">Required</p>}
            </div>

            {selectedClient === "Clear Tax" && !isEdit && (
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input
                  placeholder="e.g. ORD-12345"
                  {...register("orderId")}
                />
              </div>
            )}

            {selectedClient === "Clear Tax" && (
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input
                  placeholder="e.g. Ref-98765 (Optional)"
                  {...register("reference")}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input {...register("customerName", { required: true })} />
            </div>

            {selectedClient !== "Clear Tax" && (
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input {...register("pan", { required: selectedClient !== "Clear Tax" })} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input {...register("phone", { required: true })} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" {...register("email", { required: true })} />
            </div>

            {selectedClient === "Clear Tax" ? (
              <>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select
                    value={watch("plan")}
                    onValueChange={(v) => v && setValue("plan", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label} — ₹{p.amount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    value={watch("amount") ? `₹${watch("amount")}` : ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  {...register("amount", { required: true, valueAsNumber: true })}
                />
                {errors.amount && <p className="text-xs text-red-500">Required</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Tax Expert</Label>
              <Select
                value={watch("taxExpert")}
                onValueChange={(v) => v && setValue("taxExpert", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expert" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned Date & Time</Label>
              <Input
                type="datetime-local"
                {...register("createdAt", { required: true })}
              />
              {errors.createdAt && <p className="text-xs text-red-500">Required</p>}
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) => v && setValue("status", v as TaskFormData["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pending", "Completed", "Stuck"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label>Remarks</Label>
              <Textarea {...register("remarks")} rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : isEdit ? "Update Task" : "Assign Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
