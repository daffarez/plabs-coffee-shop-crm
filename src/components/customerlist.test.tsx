import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CustomerList } from "./customerlist";

describe("CustomerList", () => {
  const defaultProps = {
    customers: [],
    isFetching: false,
    onClickEditButton: vi.fn(),
    onClickDeleteButton: vi.fn(),
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    setCurrentPage: vi.fn(),
  };

  it("renders empty state properly", () => {
    render(<CustomerList {...defaultProps} />);
    expect(screen.getAllByText(/No customers found/i)[0]).toBeInTheDocument();
  });

  it("renders loading state indicator", () => {
    render(<CustomerList {...defaultProps} isFetching={true} />);
    expect(screen.getByText("Updating list...")).toBeInTheDocument();
  });

  it("renders customer data correctly", () => {
    const customers = [
      {
        id: "1",
        name: "John Doe",
        contact: "12345",
        favorite: "Latte",
        customer_tags: [{ interest_tags: { name: "sweet" } }],
      },
    ];
    render(
      <CustomerList
        {...defaultProps}
        customers={customers as any}
        totalCount={1}
      />,
    );

    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("12345").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Latte").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("sweet").length).toBeGreaterThanOrEqual(1);
  });

  it("calls action callbacks", () => {
    const customers = [
      {
        id: "1",
        name: "John",
        contact: null,
        favorite: null,
        customer_tags: [],
      },
    ];
    const onClickEditButton = vi.fn();
    const onClickDeleteButton = vi.fn();

    render(
      <CustomerList
        {...defaultProps}
        customers={customers as any}
        onClickEditButton={onClickEditButton}
        onClickDeleteButton={onClickDeleteButton}
      />,
    );

    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    expect(onClickEditButton).toHaveBeenCalledWith(customers[0]);

    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);
    expect(onClickDeleteButton).toHaveBeenCalledWith(customers[0]);
  });

  it("renders multiple tags and shows overflow logic on desktop", () => {
    const customers = [
      {
        id: "1",
        name: "John",
        contact: null,
        favorite: null,
        customer_tags: [
          { interest_tags: { name: "a" } },
          { interest_tags: { name: "b" } },
          { interest_tags: { name: "c" } },
        ],
      },
    ];
    render(<CustomerList {...defaultProps} customers={customers as any} />);

    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getAllByText("c").length).toBeGreaterThanOrEqual(1);
  });
});
