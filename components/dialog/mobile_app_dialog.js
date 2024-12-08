import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TabletSmartphone } from "lucide-react"


export function GetMobileAppButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
      <div className="rounded-full border-gray-600 border px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-white hover:text-black hover:border-transparent transition-all duration-300">
        <h1 className="text-sm md:text-lg">Get The Mobile App</h1>
        <TabletSmartphone size={30} />
      </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Me</DialogTitle>
          <DialogDescription>
            Track all your cards the ones you join, or even discover what new just from your mobile.
          </DialogDescription>
        </DialogHeader>
              <div>
                  <img src="Untitled.svg" />
        </div>
        <DialogFooter>
          <Button type="submit">Close window</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
