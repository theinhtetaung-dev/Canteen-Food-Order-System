using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblOrderItem
{
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int FoodId { get; set; }

    public int Quantity { get; set; }

    public decimal SnapPrice { get; set; }

    public decimal SubTotal { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual TblFood Food { get; set; } = null!;

    public virtual TblOrder Order { get; set; } = null!;
}
