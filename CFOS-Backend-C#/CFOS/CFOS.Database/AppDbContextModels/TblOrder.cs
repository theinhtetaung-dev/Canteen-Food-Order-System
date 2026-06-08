using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblOrder
{
    public int OrderId { get; set; }

    public int UserId { get; set; }

    public decimal TotalAmount { get; set; }

    public string OrderStatus { get; set; } = null!;

    public bool? DeleteFlag { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<TblOrderItem> TblOrderItems { get; set; } = new List<TblOrderItem>();

    public virtual TblPayment? TblPayment { get; set; }

    public virtual TblUser User { get; set; } = null!;
}
