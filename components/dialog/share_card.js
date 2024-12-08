import { Copy,Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"


export function ShareWaitCardButton({ waitCardLink }) {
    const { toast } = useToast()

    //* COPY TEXT
    function copyText(entryText){
        navigator.clipboard.writeText(entryText);
        toast({
            title: "Link Copied",
            description: "Link was copied to your clipboard",
          })
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
              <Button variant="outline">
                  <Share />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Share with others and wait for important events together.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={waitCardLink}
              readOnly
            />
          </div>
                  <Button
                      onClick={() => {
                          copyText(waitCardLink)
                      }}
                      type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            <Copy />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
