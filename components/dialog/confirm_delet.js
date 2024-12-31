import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
  
  export function DeleteDialog({onDeleteConfirm}) {
    return (
      <AlertDialog>
        {/* open dialog button */}
        <AlertDialogTrigger asChild>
        <Button 
            variant="destructive" 
        className="flex items-center gap-2 hover:scale-110 hover:opacity-60 duration-300 transition-all"
      >
          <Trash2 size={16} />
          </Button>
        </AlertDialogTrigger>

        {/* content */}
        <AlertDialogContent className="bg-black">
          <AlertDialogHeader>
            {/* title */}
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            {/* description */}
            <AlertDialogDescription>
              if you delete this card all people will loose access to it, and there won&apos;t be any way to get it back?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* action buttons */}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* delete button */}
            <AlertDialogAction
              asChild>
              <Button
                variant="destructive"
                onClick={() => onDeleteConfirm()}> 
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  