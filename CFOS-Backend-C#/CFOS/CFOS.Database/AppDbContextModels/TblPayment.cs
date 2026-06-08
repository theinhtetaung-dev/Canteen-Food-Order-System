using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblPayment
{
    public int PaymentId { get; set; }

    public int OrderId { get; set; }

    public decimal Amount { get; set; }

    public string? PaymentMethod { get; set; }

    public string? PaymentStatus { get; set; }

    public bool? DeleteFlag { get; set; }

    public DateTime? PaidAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual TblOrder Order { get; set; } = null!;
}
