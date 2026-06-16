import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface PaymentMethodFormValues {
    name: string;
    accountNumber: string | null;
    accountName: string | null;
    provider: string | null;
    instructions: string | null;
}

export function PaymentMethodForm({ item }: { item?: PaymentMethodFormValues }) {
    return (
        <div className="grid gap-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="pm-name">Nama Metode</Label>
                <Input
                    id="pm-name"
                    name="name"
                    placeholder="Bank BCA, DANA, Tunai"
                    defaultValue={item?.name ?? ""}
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="pm-provider">Provider</Label>
                    <Input
                        id="pm-provider"
                        name="provider"
                        placeholder="BCA"
                        defaultValue={item?.provider ?? ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pm-account-number">No. Rekening</Label>
                    <Input
                        id="pm-account-number"
                        name="accountNumber"
                        placeholder="1234567890"
                        defaultValue={item?.accountNumber ?? ""}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pm-account-name">Nama Pemilik</Label>
                <Input
                    id="pm-account-name"
                    name="accountName"
                    placeholder="Siti Aminah"
                    defaultValue={item?.accountName ?? ""}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pm-instructions">Instruksi</Label>
                <Textarea
                    id="pm-instructions"
                    name="instructions"
                    rows={3}
                    placeholder="Transfer ke rekening BCA atas nama..."
                    defaultValue={item?.instructions ?? ""}
                />
            </div>
        </div>
    );
}
