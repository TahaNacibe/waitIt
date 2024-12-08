import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { PanelLeftDashed } from "lucide-react";
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FirebaseServices from "@/services/firebase/firebase_services";

export default function NewWaitCardDialog({ onCreateWaitCard }) {
  //* manage state vars
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState()

  //* get instance
  const firebase_services = new FirebaseServices()

  //* handle the image select or change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  //* upload the image to the server and return it's new url
  const uploadImageToServer = async () => {
    // exit if no image is detected
    if (!imageFile) return null;
    const formData = new FormData();
  formData.append('file', imageFile); // Add the file to form data
    // upload the image
    const response = await fetch("api/connection/upload/upload", {
      method: 'POST',
      body: formData, // Send FormData with the file
    });
    const result = await response.json();
    if (result) {
      return result.url
    }
  };

  //* create the wait card in the server
  const handleCreateWaitCard = async () => {
    const uploadedImageUrl = await uploadImageToServer();
    await firebase_services.createNewWaitCardInTheFireBase(title, uploadedImageUrl, description, date).then((responseItem) => {
      // clear fields after that
      setTitle("");
      setImageFile(null);
      setImagePreview("");
      setDescription("");
      // if the function exist apply changes on the user ui
      if (onCreateWaitCard) onCreateWaitCard(responseItem);
    })

  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="border border-gray-700 rounded-lg p-3 w-fit cursor-pointer hover:bg-gray-800 transition duration-300 shadow-md">
          <h2 className="text-lg font-medium flex items-center gap-3 text-gray-200">
            <PanelLeftDashed className="text-gray-400" />
            Create Wait Card
          </h2>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-black rounded-xl shadow-lg border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-100">
            Create New Wait Card
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill in the details for your new Wait Card below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-4">
          {/* Add Image Button */}
          <div className="flex items-center gap-4 mb-6">
            <label
              htmlFor="image"
              className="w-32 h-32 border-2 border-gray-700 rounded-lg cursor-pointer flex justify-center items-center"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-500">+ Add Image</span>
              )}
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
                      />
                      <p className="w-2/3 text-gray-600"> the image selected here will be displayed as a background for the wait card, it's quite helpful to show what the thing we're waiting for</p>
          </div>

          {/* Input Fields */}
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title" className="text-sm text-gray-300">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter wait card title"
                className="rounded-md border border-gray-700 text-gray-200 focus:ring-2 focus:ring-gray-600"
              />
            </div>
            <div className="flex flex-col gap-2">
            <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="waitToDate" className="text-sm text-gray-300">
              Description
              </Label>
              <textarea
                id="waitToDate"
                type="date"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-md border border-gray-700 text-gray-200 bg-black focus:ring-2 focus:ring-transparent p-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="px-4 pb-4">
          <Button
            type="submit"
            onClick={handleCreateWaitCard}
            disabled={!title || !imageFile || !waitToDate}
            className={`w-full py-2 rounded-md ${
              title && imageFile && waitToDate
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {title && imageFile && waitToDate ? "Create Wait Card" : "Fill All Fields"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
