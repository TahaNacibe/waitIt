import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FirebaseServices from "@/services/firebase/firebase_services";
import { Timestamp } from "firebase/firestore";
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
} from "@/components/ui/popover";
import LoadingSpinner from "../animated/loading_spiner";
import Image from "next/image";

export default function EditWaitCardDialog({ onEditCard, imageValue, descValue, titleValue, dateValue, cardId, ownerId }) {
  //* manage state vars
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [datePreview, setDatePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  //* get instance
  const firebase_services = new FirebaseServices()

  //* 
  useEffect(() => {
    setTitle(titleValue ?? "");
    setImagePreview(imageValue ?? "");
    setDescription(descValue ?? "");
    if (dateValue instanceof Timestamp) {
      setDatePreview(dateValue);
    } else {
      setDatePreview(new Timestamp(dateValue));
    }
  }, [titleValue, imageValue, descValue, dateValue]);


  //* handle the image change action and set the preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


  //* upload the image to the server and return it's url
  const uploadImageToServer = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append("oldUrl", imageValue); // Add the old image URL to delete it if needed

    const response = await fetch("api/connection/upload/upload", {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (result) {
      return result.url;
    }
  };


  //* apply the edit on the item
  const handleEditWaitCard = async () => {
    setIsLoading(true)
    const uploadedImageUrl = await uploadImageToServer() ?? imagePreview;

    firebase_services.editExistingWaitCardInTheFirebase({title,description, image:uploadedImageUrl,waitToDate:date}, cardId, ownerId).then((updatedCard) => {
     // clear all fields after
      setTitle("");
      setImageFile(null);
      setImagePreview("");
      setDescription("");
      setDate("");
      // return the edited card to update the data the user have
      onEditCard(updatedCard);
    });
  };

  //* ui tree
  return (
    <Dialog>
      {/* open dialog button */}
      <DialogTrigger asChild>
        <Button className="hover:scale-110 hover:opacity-60 duration-300 transition-all">
          <Pencil size={25} />
        </Button>
      </DialogTrigger>
      {/* content */}
      <DialogContent className="sm:max-w-[525px] bg-black rounded-xl shadow-lg border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-100">
            Edit Wait Card
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Edit the details of your Wait Card below.
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
                <Image
                  width={300}
                  height={300}
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
            <p className="w-2/3 text-gray-600">
              The image selected here will be displayed as a background for the wait card. It&apos;s quite helpful to show what the thing we&apos;re waiting for.
            </p>
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
                    {date || datePreview ? (date? format(date, "PPPP") : format(Date(date), "PPPP")) : <span>Pick a date</span>}
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
              <Label htmlFor="description" className="text-sm text-gray-300">
                Description
              </Label>
              <textarea
                id="description"
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
            onClick={handleEditWaitCard}
            disabled={!title || !imagePreview || !date }
            className={`w-full py-2 rounded-md ${
              title && imagePreview && date && description
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {title && imagePreview && date ? isLoading? <LoadingSpinner /> : "Save Changes" : "Fill All Fields"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
