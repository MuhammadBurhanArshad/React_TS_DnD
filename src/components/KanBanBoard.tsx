import PlusIcon from "@/icons/PlusIcon"
import { Column } from "@/types"
import { useState } from "react"

const KanBanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([])

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <div className="m-auto">
        <button onClick={createColumn} className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2">
          <PlusIcon/> Add Column
        </button>
      </div>
    </div>
  )

  function createColumn(){}
}

export default KanBanBoard
